<?php

namespace common\models;

use common\models\query\CoRoomTypesRoomsQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_room_types_rooms".
 *
 * @property integer $room_type_room_id
 * @property integer $tenant_id
 * @property integer $room_type_id
 * @property integer $room_id
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoRoomType $roomType
 * @property CoRoom $room
 * @property CoTenant $tenant
 */
class CoRoomTypesRooms extends RActiveRecord {

    public $room_type_ids;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_room_types_rooms';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'room_id', 'room_type_ids'], 'required', 'on' => 'roomtypesassign'],
                [['tenant_id', 'room_type_id', 'room_id', 'created_by', 'modified_by'], 'integer'],
                [['created_at', 'modified_at', 'room_type_ids'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'room_type_room_id' => 'Room Type Room ID',
            'tenant_id' => 'Tenant ID',
            'room_type_id' => 'Room Type ID',
            'room_id' => 'Room ID',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'room_type_ids' => 'Room Types',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getRoomType() {
        return $this->hasOne(CoRoomType::className(), ['room_type_id' => 'room_type_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRoom() {
        return $this->hasOne(CoRoom::className(), ['room_id' => 'room_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoRoomTypesRoomsQuery(get_called_class());
    }

    public static function getRoomTypesRoomslist($tenant = null) {
        $list = self::find()->tenant($tenant)->all();
        return $list;
    }

    public function fields() {
        $extend = [
            'bed_name' => function ($model) {
                return (isset($model->room) ? $model->room->bed_name : '-');
            },
            'room_type_name' => function ($model) {
                return (isset($model->roomType) ? $model->roomType->room_type_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

//    public function afterSave($insert, $changedAttributes) {
//        $room = CoRoom::find()->where(['room_id' => $this->room_id])->one();
//        if ($insert)
//            $activity = 'Bed Types Added Successfully (#' . $room->bed_name . ' )';
//        else
//            $activity = 'Bed Types Updated Successfully (#' . $room->bed_name . ' )';
//        CoAuditLog::insertAuditLog(CoRoomTypesRooms::tableName(), $this->room_type_room_id, $activity);
//        return parent::afterSave($insert, $changedAttributes);
//    }

}
