import { EquipmentTrait } from "@item/equipment/data";
import {
    BasePhysicalItemData,
    BasePhysicalItemSource,
    Investable,
    PhysicalItemTraits,
    PhysicalSystemData,
    PhysicalSystemSource,
} from "@item/physical/data";
import { ContainerXPRPG } from ".";

type ContainerSource = BasePhysicalItemSource<"backpack", ContainerSystemSource>;

type ContainerData = Omit<ContainerSource, "system" | "effects" | "flags"> &
    BasePhysicalItemData<ContainerXPRPG, "backpack", ContainerSystemData, ContainerSource>;

type ContainerTraits = PhysicalItemTraits<EquipmentTrait>;

interface ContainerSystemSource extends Investable<PhysicalSystemSource> {
    traits: ContainerTraits;
    stowing: boolean;
    bulkCapacity: {
        value: string | null;
    };
    collapsed: boolean;
}

interface ContainerSystemData
    extends Omit<ContainerSystemSource, "identification" | "price" | "temporary" | "usage">,
        Omit<Investable<PhysicalSystemData>, "traits"> {}

export { ContainerData, ContainerSource };
